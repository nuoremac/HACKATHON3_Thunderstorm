const errorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    error: { type: "string", example: "identifiant invalide" },
    code: { type: "string", example: "INVALID_ID" },
    details: { nullable: true }
  },
  required: ["success", "error", "code"]
};

function successResponse(schema: Record<string, unknown>, description: string, example?: unknown) {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: schema
          },
          required: ["success", "data"]
        },
        ...(example === undefined ? {} : { example: { success: true, data: example } })
      }
    }
  };
}

function errorResponse(
  status: string,
  description: string,
  example: { error: string; code: string; details?: unknown }
) {
  return [
    status,
    {
      description,
      content: {
        "application/json": {
          schema: errorSchema,
          example: {
            success: false,
            error: example.error,
            code: example.code,
            ...(example.details === undefined ? {} : { details: example.details })
          }
        }
      }
    }
  ] as const;
}

const studentSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", example: "Raoul Ndzi" },
    email: { type: "string", format: "email", example: "raoul@example.edu" },
    department: { type: "string", example: "Computer Science" },
    academic_year: { type: "string", example: "Year 2" },
    interests: { type: "array", items: { type: "string" } },
    skills_offered: { type: "array", items: { type: "string" } },
    skills_needed: { type: "array", items: { type: "string" } },
    availability: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string", example: "Monday" },
          start: { type: "string", format: "date-time" },
          end: { type: "string", format: "date-time" },
          location: { type: "string", example: "Science Block" }
        },
        required: ["start", "end"]
      }
    },
    profile_links: {
      type: "object",
      nullable: true,
      additionalProperties: { type: "string" }
    },
    privacy_level: { type: "string", enum: ["public", "campus", "private"] },
    profile_completeness: { type: "number", minimum: 0, maximum: 1, example: 0.68 },
    created_at: { type: "string", format: "date-time" }
  }
};

const studentCreateSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string", format: "email" },
    department: { type: "string" },
    academic_year: { type: "string" },
    interests: { type: "array", items: { type: "string" } },
    skills_offered: { type: "array", items: { type: "string" } },
    skills_needed: { type: "array", items: { type: "string" } },
    availability: studentSchema.properties.availability,
    profile_links: studentSchema.properties.profile_links,
    privacy_level: studentSchema.properties.privacy_level,
    profile_completeness: studentSchema.properties.profile_completeness
  },
  required: ["name", "email", "department", "academic_year"]
};

const studentPatchSchema = {
  type: "object",
  properties: studentCreateSchema.properties,
  minProperties: 1
};

const associationSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", example: "AI Club" },
    description: { type: "string", example: "Community for applied AI and campus projects." },
    tags: { type: "array", items: { type: "string" } },
    contact: { type: "string", nullable: true, example: "aiclub@example.edu" },
    recruitment_needs: { type: "array", items: { type: "string" } },
    created_at: { type: "string", format: "date-time" }
  }
};

const eventSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    association_id: { type: "string", format: "uuid" },
    title: { type: "string", example: "AI Club Workshop" },
    description: { type: "string", example: "Hands-on session on beginner-friendly AI projects." },
    tags: { type: "array", items: { type: "string" } },
    start_time: { type: "string", format: "date-time" },
    end_time: { type: "string", format: "date-time" },
    location: { type: "string", example: "Innovation Hub" },
    capacity: { type: "integer", nullable: true, example: 80 },
    source: { type: "string", example: "official_association" },
    verification_status: { type: "string", enum: ["verified", "pending", "unverified"] },
    created_at: { type: "string", format: "date-time" }
  }
};

const eventCreateSchema = {
  type: "object",
  properties: {
    association_id: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    start_time: { type: "string", format: "date-time" },
    end_time: { type: "string", format: "date-time" },
    location: { type: "string" },
    capacity: { type: "integer", nullable: true, minimum: 1 },
    source: { type: "string" },
    verification_status: { type: "string", enum: ["verified", "pending", "unverified"] }
  },
  required: ["association_id", "title", "start_time", "end_time"]
};

const helpRequestSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    requester_id: { type: "string", format: "uuid" },
    helper_id: { type: "string", format: "uuid", nullable: true },
    skill: { type: "string", example: "Linear Algebra" },
    message: { type: "string", example: "I need help preparing for Friday's quiz." },
    status: { type: "string", enum: ["open", "accepted", "rejected", "completed", "rescheduled"] },
    created_at: { type: "string", format: "date-time" },
    completed_at: { type: "string", format: "date-time", nullable: true }
  }
};

const helpRequestCreateSchema = {
  type: "object",
  properties: {
    requester_id: { type: "string", format: "uuid" },
    helper_id: { type: "string", format: "uuid", nullable: true },
    skill: { type: "string" },
    message: { type: "string" },
    status: { type: "string", enum: ["open", "accepted", "rejected", "completed", "rescheduled"] },
    completed_at: { type: "string", format: "date-time", nullable: true }
  },
  required: ["requester_id", "skill", "message"]
};

const helpRequestPatchSchema = {
  type: "object",
  properties: helpRequestCreateSchema.properties,
  minProperties: 1
};

const feedbackSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    request_id: { type: "string", format: "uuid" },
    from_student_id: { type: "string", format: "uuid" },
    to_student_id: { type: "string", format: "uuid" },
    rating: { type: "integer", minimum: 1, maximum: 5 },
    comment: { type: "string", nullable: true },
    skill_confirmed: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time" }
  }
};

const feedbackCreateSchema = {
  type: "object",
  properties: {
    request_id: { type: "string", format: "uuid" },
    from_student_id: { type: "string", format: "uuid" },
    to_student_id: { type: "string", format: "uuid" },
    rating: { type: "integer", minimum: 1, maximum: 5 },
    comment: { type: "string", nullable: true },
    skill_confirmed: { type: "string", nullable: true }
  },
  required: ["request_id", "from_student_id", "to_student_id", "rating"]
};

const impactSchema = {
  type: "object",
  properties: {
    student_id: { type: "string", format: "uuid" },
    helped_count: { type: "integer", example: 4 },
    positive_feedback: { type: "integer", example: 3 },
    skill_confidence_score: { type: "number", example: 0.75 },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          student_id: { type: "string", format: "uuid" },
          skill: { type: "string" },
          helped_count: { type: "integer" },
          positive_feedback_count: { type: "integer" },
          confidence_score: { type: "number" }
        }
      }
    }
  }
};

const signalSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    student_id: { type: "string", format: "uuid" },
    signal_type: { type: "string", example: "interest_inferred" },
    value: { type: "string", example: "AI" },
    source: { type: "string", example: "event_click" },
    confidence: { type: "number", minimum: 0, maximum: 1, example: 0.58 },
    created_at: { type: "string", format: "date-time" },
    expires_at: { type: "string", format: "date-time", nullable: true }
  }
};

const recommendationSchema = {
  type: "object",
  properties: {
    targetType: { type: "string", enum: ["student", "association", "event", "help_opportunity"] },
    targetId: { type: "string", format: "uuid" },
    recommendationType: { type: "string", example: "event_attendance" },
    score: { type: "number", example: 0.87 },
    confidence: { type: "number", example: 0.82 },
    explanation: {
      type: "object",
      properties: {
        why_this_recommendation: { type: "array", items: { type: "string" } },
        why_now: { type: "array", items: { type: "string" } },
        data_used: { type: "array", items: { type: "string" } },
        assumptions_used: { type: "array", items: { type: "string" } }
      }
    },
    assumptions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          assumption: { type: "string" },
          source: { type: "string" },
          confidence: { type: "number" },
          risk_level: { type: "string", enum: ["low", "medium", "high"] },
          confidence_impact: { type: "number" },
          is_user_confirmed: { type: "boolean" }
        }
      }
    },
    scoreBreakdown: {
      type: "object",
      additionalProperties: { type: "number" }
    },
    target: {
      oneOf: [
        { $ref: "#/components/schemas/Student" },
        { $ref: "#/components/schemas/Association" },
        { $ref: "#/components/schemas/Event" },
        { $ref: "#/components/schemas/HelpRequest" }
      ]
    }
  }
};

const analyticsSchema = {
  type: "object",
  properties: {
    engagement_by_department: { type: "array", items: { type: "object" } },
    most_requested_skills: { type: "array", items: { type: "object" } },
    isolated_students: { type: "array", items: { type: "object" } },
    invisible_events: { type: "array", items: { type: "object" } },
    system_health_metrics: { type: "object" }
  }
};

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Campus Radar API",
    version: "1.0.0"
  },
  tags: [
    { name: "Students" },
    { name: "Associations" },
    { name: "Events" },
    { name: "Recommendations" },
    { name: "Help Requests" },
    { name: "Feedback" },
    { name: "Impact" },
    { name: "Signals" },
    { name: "Admin" }
  ],
  paths: {
    "/api/students": {
      get: {
        tags: ["Students"],
        summary: "List students",
        responses: {
          "200": successResponse({ type: "array", items: { $ref: "#/components/schemas/Student" } }, "Students fetched")
        }
      },
      post: {
        tags: ["Students"],
        summary: "Create student",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentCreate" }
            }
          }
        },
        responses: Object.fromEntries([
          ["201", successResponse({ $ref: "#/components/schemas/Student" }, "Student created")],
          errorResponse("400", "Invalid payload", {
            error: "corps de requete requis",
            code: "BODY_REQUIRED"
          }),
          errorResponse("409", "Duplicate email", {
            error: "email deja utilise",
            code: "EMAIL_ALREADY_EXISTS"
          }),
          errorResponse("500", "Unexpected failure", {
            error: "erreur interne du serveur",
            code: "STUDENT_CREATE_FAILED"
          })
        ])
      }
    },
    "/api/students/{id}": {
      get: {
        tags: ["Students"],
        summary: "Get student by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: Object.fromEntries([
          ["200", successResponse({ $ref: "#/components/schemas/Student" }, "Student fetched")],
          errorResponse("400", "Invalid id", {
            error: "identifiant invalide",
            code: "INVALID_ID"
          }),
          errorResponse("404", "Student not found", {
            error: "etudiant introuvable",
            code: "STUDENT_NOT_FOUND"
          })
        ])
      },
      patch: {
        tags: ["Students"],
        summary: "Update student",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StudentPatch" } } }
        },
        responses: Object.fromEntries([
          ["200", successResponse({ $ref: "#/components/schemas/Student" }, "Student updated")],
          errorResponse("400", "Invalid request", {
            error: "au moins un champ doit etre fourni",
            code: "EMPTY_UPDATE_PAYLOAD"
          }),
          errorResponse("404", "Student not found", {
            error: "etudiant introuvable",
            code: "STUDENT_NOT_FOUND"
          }),
          errorResponse("409", "Duplicate email", {
            error: "email deja utilise",
            code: "EMAIL_ALREADY_EXISTS"
          })
        ])
      }
    },
    "/api/associations": {
      get: {
        tags: ["Associations"],
        summary: "List associations",
        responses: {
          "200": successResponse(
            { type: "array", items: { $ref: "#/components/schemas/Association" } },
            "Associations fetched"
          )
        }
      },
      post: {
        tags: ["Associations"],
        summary: "Create association",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AssociationCreate" } } }
        },
        responses: Object.fromEntries([
          ["201", successResponse({ $ref: "#/components/schemas/Association" }, "Association created")],
          errorResponse("400", "Invalid payload", {
            error: "name est requis",
            code: "NAME_REQUIRED"
          })
        ])
      }
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "List events",
        responses: {
          "200": successResponse({ type: "array", items: { $ref: "#/components/schemas/Event" } }, "Events fetched")
        }
      },
      post: {
        tags: ["Events"],
        summary: "Create event",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EventCreate" } } }
        },
        responses: Object.fromEntries([
          ["201", successResponse({ $ref: "#/components/schemas/Event" }, "Event created")],
          errorResponse("400", "Invalid payload", {
            error: "association inexistante",
            code: "ASSOCIATION_NOT_FOUND"
          }),
          errorResponse("422", "Invalid business rule", {
            error: "dates d'evenement invalides",
            code: "INVALID_EVENT_TIME_RANGE"
          })
        ])
      }
    },
    "/api/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Get event by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: Object.fromEntries([
          ["200", successResponse({ $ref: "#/components/schemas/Event" }, "Event fetched")],
          errorResponse("400", "Invalid id", {
            error: "identifiant invalide",
            code: "INVALID_ID"
          }),
          errorResponse("404", "Event not found", {
            error: "evenement introuvable",
            code: "EVENT_NOT_FOUND"
          })
        ])
      }
    },
    "/api/recommendations/{studentId}": {
      get: {
        tags: ["Recommendations"],
        summary: "Generate recommendations for a student",
        parameters: [{ name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: Object.fromEntries([
          [
            "200",
            successResponse(
              {
                type: "object",
                properties: {
                  student: { $ref: "#/components/schemas/Student" },
                  generated_at: { type: "string", format: "date-time" },
                  recommendations: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Recommendation" }
                  }
                }
              },
              "Recommendations generated"
            )
          ],
          errorResponse("400", "Invalid id", {
            error: "identifiant invalide",
            code: "INVALID_ID"
          }),
          errorResponse("404", "Student not found", {
            error: "etudiant introuvable",
            code: "STUDENT_NOT_FOUND"
          })
        ])
      }
    },
    "/api/help-requests": {
      post: {
        tags: ["Help Requests"],
        summary: "Create help request",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/HelpRequestCreate" } } }
        },
        responses: Object.fromEntries([
          ["201", successResponse({ $ref: "#/components/schemas/HelpRequest" }, "Help request created")],
          errorResponse("400", "Invalid payload", {
            error: "utilisateur inexistant",
            code: "STUDENT_NOT_FOUND"
          }),
          errorResponse("422", "Business rule violation", {
            error: "le demandeur ne peut pas etre son propre helper",
            code: "INVALID_HELP_REQUEST_RELATION"
          })
        ])
      }
    },
    "/api/help-requests/{id}": {
      get: {
        tags: ["Help Requests"],
        summary: "List help requests for a student id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: Object.fromEntries([
          [
            "200",
            successResponse(
              { type: "array", items: { $ref: "#/components/schemas/HelpRequest" } },
              "Help requests fetched"
            )
          ],
          errorResponse("400", "Invalid id", {
            error: "identifiant invalide",
            code: "INVALID_ID"
          }),
          errorResponse("404", "Student not found", {
            error: "etudiant introuvable",
            code: "STUDENT_NOT_FOUND"
          })
        ])
      },
      patch: {
        tags: ["Help Requests"],
        summary: "Update help request",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/HelpRequestPatch" } } }
        },
        responses: Object.fromEntries([
          ["200", successResponse({ $ref: "#/components/schemas/HelpRequest" }, "Help request updated")],
          errorResponse("400", "Invalid request", {
            error: "au moins un champ doit etre fourni",
            code: "EMPTY_UPDATE_PAYLOAD"
          }),
          errorResponse("404", "Help request not found", {
            error: "demande d'aide introuvable",
            code: "HELP_REQUEST_NOT_FOUND"
          }),
          errorResponse("422", "Business rule violation", {
            error: "un helper est requis pour terminer la demande",
            code: "HELPER_REQUIRED"
          })
        ])
      }
    },
    "/api/feedback": {
      post: {
        tags: ["Feedback"],
        summary: "Submit feedback",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/FeedbackCreate" } } }
        },
        responses: Object.fromEntries([
          [
            "201",
            successResponse(
              {
                type: "object",
                properties: {
                  feedback: { $ref: "#/components/schemas/Feedback" },
                  impact: { $ref: "#/components/schemas/Impact" }
                }
              },
              "Feedback created"
            )
          ],
          errorResponse("400", "Invalid payload", {
            error: "request_id invalide",
            code: "INVALID_REQUEST_ID"
          }),
          errorResponse("422", "Invalid rating", {
            error: "la demande doit etre terminee avant feedback",
            code: "HELP_REQUEST_NOT_COMPLETED"
          })
        ])
      }
    },
    "/api/impact/{studentId}": {
      get: {
        tags: ["Impact"],
        summary: "Compute impact for a student",
        parameters: [{ name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: Object.fromEntries([
          ["200", successResponse({ $ref: "#/components/schemas/Impact" }, "Impact fetched")],
          errorResponse("400", "Invalid id", {
            error: "identifiant invalide",
            code: "INVALID_ID"
          }),
          errorResponse("404", "Student not found", {
            error: "etudiant introuvable",
            code: "STUDENT_NOT_FOUND"
          })
        ])
      }
    },
    "/api/signals": {
      post: {
        tags: ["Signals"],
        summary: "Create signal",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignalCreate" } } }
        },
        responses: Object.fromEntries([
          ["201", successResponse({ $ref: "#/components/schemas/Signal" }, "Signal created")],
          errorResponse("400", "Invalid payload", {
            error: "utilisateur inexistant",
            code: "STUDENT_NOT_FOUND"
          })
        ])
      }
    },
    "/api/admin/analytics": {
      get: {
        tags: ["Admin"],
        summary: "Get admin analytics",
        responses: {
          "200": successResponse({ $ref: "#/components/schemas/Analytics" }, "Analytics fetched")
        }
      }
    }
  },
  components: {
    schemas: {
      Student: studentSchema,
      StudentCreate: studentCreateSchema,
      StudentPatch: studentPatchSchema,
      Association: associationSchema,
      AssociationCreate: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          contact: { type: "string", nullable: true },
          recruitment_needs: { type: "array", items: { type: "string" } }
        },
        required: ["name", "description"]
      },
      Event: eventSchema,
      EventCreate: eventCreateSchema,
      HelpRequest: helpRequestSchema,
      HelpRequestCreate: helpRequestCreateSchema,
      HelpRequestPatch: helpRequestPatchSchema,
      Feedback: feedbackSchema,
      FeedbackCreate: feedbackCreateSchema,
      Impact: impactSchema,
      Signal: signalSchema,
      SignalCreate: {
        type: "object",
        properties: {
          student_id: { type: "string", format: "uuid" },
          signal_type: { type: "string" },
          value: { type: "string" },
          source: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          expires_at: { type: "string", format: "date-time", nullable: true }
        },
        required: ["student_id", "signal_type", "value", "source"]
      },
      Recommendation: recommendationSchema,
      Analytics: analyticsSchema,
      ApiError: errorSchema
    }
  }
};
