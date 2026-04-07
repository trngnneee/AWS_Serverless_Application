import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "TasksTable";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://d14g6okcs1rawz.cloudfront.net",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
};

export const handler = async (event) => {
  console.log("SUCCESS: Connected to DynamoDB. Status: 200");

  const { httpMethod, path, body } = event;

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS Preflight OK" })
    };
  }

  try {
    // ========================
    // GET /tasks
    // ========================
    if (httpMethod === "GET" && path === "/tasks") {
      const data = await docClient.send(
        new ScanCommand({ TableName: TABLE_NAME })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ code: 200, data: data.Items })
      };
    }

    // ========================
    // POST /tasks
    // ========================
    if (httpMethod === "POST" && path === "/tasks") {
      const itemData = JSON.parse(body);

      if (!itemData.userId || !itemData.title) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "userId and title are required"
          })
        };
      }

      const item = {
        taskId: crypto.randomUUID(),
        userId: itemData.userId,
        title: itemData.title,
        description: itemData.description || "",
        priority: itemData.priority || "low",
        dueDate: itemData.dueDate || null,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item
        })
      );

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          code: 201,
          message: "Task created",
          data: item
        })
      };
    }

    // ========================
    // PUT /tasks/{id}
    // ========================
    if (httpMethod === "PUT" && path.startsWith("/tasks/")) {
      const taskId = path.split("/")[2];
      const updateData = JSON.parse(body);

      let updateExp = "SET";
      const expAttrValues = {};
      const expAttrNames = {};

      let first = true;

      const fields = [
        "title",
        "description",
        "priority",
        "dueDate",
        "status"
      ];

      for (const field of fields) {
        if (updateData[field] !== undefined) {
          if (!first) updateExp += ",";
          updateExp += ` #${field} = :${field}`;
          expAttrNames[`#${field}`] = field;
          expAttrValues[`:${field}`] = updateData[field];
          first = false;
        }
      }

      if (first) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "No fields to update" })
        };
      }

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { taskId },
          UpdateExpression: updateExp,
          ExpressionAttributeNames: expAttrNames,
          ExpressionAttributeValues: expAttrValues,
          ReturnValues: "ALL_NEW"
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          code: 200,
          message: "Task updated"
        })
      };
    }

    // ========================
    // DELETE /tasks/{id}
    // ========================
    if (httpMethod === "DELETE" && path.startsWith("/tasks/")) {
      const taskId = path.split("/")[2];

      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { taskId }
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          code: 200,
          message: `Deleted task ${taskId}`
        })
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Route not found" })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};