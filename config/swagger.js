const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Travel Itinerary API",
      version: "1.0.0",
      description:
        "A comprehensive REST API for managing travel itineraries with authentication, caching, and collaboration features.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? `https://travel-itinerary-szjy.onrender.com`
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            current: {
              type: "integer",
              description: "Current page number",
            },
            pages: {
              type: "integer",
              description: "Total number of pages",
            },
            total: {
              type: "integer",
              description: "Total number of items",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication information is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Not authorized to access this route",
              },
            },
          },
        },
        ForbiddenError: {
          description: "Access denied",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Not authorized to access this resource",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Resource not found",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Validation failed",
                errors: [
                  {
                    field: "email",
                    message: "Please provide a valid email",
                  },
                ],
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Server Error",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and profile management",
      },
      {
        name: "Itineraries",
        description: "Travel itinerary management",
      },
      {
        name: "Health",
        description: "API health and status",
      },
    ],
  },
  apis: ["./routes/*.js", "./server.js"],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  // Swagger UI options
  const swaggerUiOptions = {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
    `,
    customSiteTitle: 'Travel Itinerary API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Serve raw JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 API Documentation available at: http://localhost:${process.env.PORT || 3000}/api-docs`);
};

module.exports = swaggerSetup;
