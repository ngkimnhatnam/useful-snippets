/**
 * Sample PartiQL query against DynamoDb table
 * With GSI index
*/

SELECT attributeA,attributeB,attributeC
FROM "table-name"."gsi-index-name" 
WHERE "tableAttributeString" = 'someValue' AND "tableAttributeAsNested" != []