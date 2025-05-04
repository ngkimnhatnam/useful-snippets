const protobuf = require("protobufjs");
const LZUTF8 = require("lzutf8");
const zlib = require("zlib");
 
// Sample snippet to benchmark different compression algorithms against same payload
// Protobuf - Brotli - Lzutf8


// Replace this with your actual payload or load it from a file
const payload = require("./test.json");

/**
 * To use ProtoBuf protocol, it needs a schema
 * 
 * Sample schema.proto file content
 * 
 *  syntax = "proto3";

    message NestedData {
      string id = 1;
      repeated string roles = 2;
    }

    message Data {
      string someValueA = 1;
      bool someValueB = 2;
      repeated string someValueC = 3;
      repeated NestedData someValueD = 4;
    }

    message DataList {
      repeated Data items = 1;
    }
*/
 
async function runBenchmarks() {
  const root = await protobuf.load("schema.proto");
  const DataList = root.lookupType("DataList");
 
  // Encode to Protobuf binary
  const message = DataList.create({ items: payload });
  const protobufBuffer = DataList.encode(message).finish();
 
  // Minified JSON
  const jsonString = JSON.stringify(payload);
 
  const buffer = Buffer.from(jsonString, "utf-8");
  const brotliCompressed = zlib.brotliCompressSync(buffer);
  const base64Brotli = Buffer.from(brotliCompressed).toString("base64");
 
  // LZUTF8 Compressed JSON
  const lzJson = LZUTF8.compress(jsonString, {
    outputEncoding: "Base64",
  });
  const lzJsonAsByteArray = LZUTF8.compress(jsonString, {
    outputEncoding: "ByteArray",
  });
 
  // LZUTF8 Compressed Protobuf
  const lzProtobuf = LZUTF8.compress(protobufBuffer, {
    inputEncoding: "ByteArray",
    outputEncoding: "ByteArray",
  });
 
  // Benchmark size
  const sizes = {
    "JSON (pretty)": Buffer.byteLength(JSON.stringify(payload, null, 2)),
    "JSON (minified)": Buffer.byteLength(jsonString),
    "LZUTF8 JSON": lzJson.length,
    "LZUTF8 JSON (ByteArray)": lzJsonAsByteArray.length,
    Protobuf: protobufBuffer.length,
    "LZUTF8 Protobuf": lzProtobuf.length,
    "Brotli JSON Base64": base64Brotli.length,
  };
 
  console.table(sizes);
 
  // Optional: Benchmark encode/decode time
  console.time("LZUTF8 JSON decompress");
  LZUTF8.decompress(lzJson, {
    inputEncoding: "Base64",
  });
  console.timeEnd("LZUTF8 JSON decompress");
 
  console.time("LZUTF8 ByteArray decompress");
  LZUTF8.decompress(lzJsonAsByteArray, {
    inputEncoding: "ByteArray",
  });
  console.timeEnd("LZUTF8 ByteArray decompress");
 
  console.time("LZUTF8 Protobuf decompress");
  LZUTF8.decompress(lzProtobuf, {
    inputEncoding: "ByteArray",
    outputEncoding: "ByteArray",
  });
  console.timeEnd("LZUTF8 Protobuf decompress");
 
  console.time("Brotli base64 decompress");
  const brotliBuffer = Buffer.from(base64Brotli, "base64");
  zlib.brotliDecompressSync(brotliBuffer);
  console.timeEnd("Brotli base64 decompress");
}
 
async function decodeData(buffer) {
  const root = await protobuf.load("schema.proto");
  const DataList = root.lookupType("DataList");
 
  const decodedData = DataList.decode(buffer);
  console.log("Buffer from protobuf decode: ", decodedData);
  return decodedData;
}
 
runBenchmarks();