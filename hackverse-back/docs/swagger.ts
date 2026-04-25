const studentSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", example: "Raoul Ndzi" },
    email: { type: "string", format: "email", example: "raoul@example.edu" },
    department: { type: "string", example: "Computer Science" },
    academic_year: { type: "string", example: "Year 2" },
    interests: { type: "array", items: { type: "string" }, example: ["AI", "Robotics"] },
    skills_offered: { type: "array", items: { type: "string" }, example: ["React", "Physics"] },
    skills_needed: { type: "array", items: { type: "string" }, example: ["Linear Algebra"] },
    availability: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string", example: "Monday" },
          start: { type: "string", format: "date-time" },
          end: { type: "string", format: "date-time" },
          location: { type: "string", example: "Science Block" }
        }
      }
    },
    profile_links: {
      type: "object",
      additionalProperties: { type: "string" },
      example: { github: "https://github.com/raoul", linkedin: "https://linkedin.com/in/raoul" }
    },
    privacy_level: { type: "string", enum: ["public", "campus", "private"] },
    profile_completeness: { type: "number", example: 0.68 }
  }
};

const associationSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", example: "AI Club" },
    description: { type: "string", example: "Community for applied AI and campus projects." },
    mission: { type: "string", example: "Connect students around applied AI learning." },
    tags: { type: "array", items: { type: "string" }, example: ["AI", "Projects", "Community"] },
    contact: { type: "string", example: "aiclub@example.edu" },
    recruitment_needs: { type: "array", items: { type: "string" }, example: ["Python", "Design"] }
  }
};

const eventSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", example: "AI Club Workshop" },
    association_id: { type: "string", format: "uuid" },
    description: { type: "string", example: "Hands-on session on beginner-friendly AI projects." },
    tags: { type: "array", items: { type: "string" }, example: ["AI", "Workshop"] },
    start_time: { type: "string", format: "date-time" },
    end_time: { type: "string", format: "date-time" },
    location: { type: "string", example: "Innovation Hub" },
    capacity: { type: "integer", nullable: true, example: 80 },
    source: { type: "string", example: "official_association" },
    verification_status: { type: "string", enum: ["verified", "pending", "unverified"] }
  }
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
    request_type: { type: "string", example: "ask_for_help" },
    scheduled_start: { type: "string", format: "date-time", nullable: true },
    scheduled_end: { type: "string", format: "date-time", nullable: true }
  }
};

const feedbackSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    request_id: { type: "string", format: "uuid" },
    from_student_id: { type: "string", format: "uuid" },
    to_student_id: { type: "string", format: "uuid" },
    rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
    comment: { type: "string", nullable: true, example: "Very clear explanation." },
    skill_confirmed: { type: "string", nullable: true, example: "Linear Algebra" }
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
    confidence: { type: "number", example: 0.58 },
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

export const swaggerDocument = {
  openapi: "3.1.0",
  info: {
    title: "Campus Radar Backend API",
    version: "1.0.0",
    description:
      "Production-grade REST backend for Campus Radar with contextual recommendations, explainability, assumption tracking, impact scoring, and admin analytics."
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
          "200": {
            description: "Students fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "array", items: { $ref: "#/components/schemas/Student" } } }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Students"],
        summary: "Create student",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } }
        },
        responses: {
          "201": {
            description: "Student created",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Student" } } } } }
          }
        }
      }
    },
    "/api/students/{id}": {
      get: {
        tags: ["Students"],
        summary: "Get student by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Student fetched",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Student" } } } } }
          }
        }
      },
      patch: {
        tags: ["Students"],
        summary: "Update student",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } }
        },
        responses: {
          "200": {
            description: "Student updated",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Student" } } } } }
          }
        }
      }
    },
    "/api/associations": {
      get: {
        tags: ["Associations"],
        summary: "List associations",
        responses: {
          "200": {
            description: "Associations fetched",
            content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Association" } } } } } }
          }
        }
      },
      post: {
        tags: ["Associations"],
        summary: "Create association",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Association" } } }
        },
        responses: {
          "201": {
            description: "Association created",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Association" } } } } }
          }
        }
      }
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "List events",
        responses: {
          "200": {
            description: "Events fetched",
            content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } }
          }
        }
      },
      post: {
        tags: ["Events"],
        summary: "Create event",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } }
        },
        responses: {
          "201": {
            description: "Event created",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Event" } } } } }
          }
        }
      }
    },
    "/api/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Get event by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Event fetched",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Event" } } } } }
          }
        }
      }
    },
    "/api/recommendations/{studentId}": {
      get: {
        tags: ["Recommendations"],
        summary: "Generate full explainable recommendations for a student",
        parameters: [{ name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Recommendations generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    student: { $ref: "#/components/schemas/Student" },
                    generated_at: { type: "string", format: "date-time" },
                    recommendations: { type: "array", items: { $ref: "#/components/schemas/Recommendation" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/help-requests": {
      post: {
        tags: ["Help Requests"],
        summary: "Create structured contextual request",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/HelpRequest" } } }
        },
        responses: {
          "201": {
            description: "Help request created",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/HelpRequest" } } } } }
          }
        }
      }
    },
    "/api/help-requests/{id}": {
      get: {
        tags: ["Help Requests"],
        summary: "List help requests for a student",
        parameters: [{ name: "id", in: "path", required: true, description: "Student id", schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Help requests fetched",
            content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/HelpRequest" } } } } } }
          }
        }
      },
      patch: {
        tags: ["Help Requests"],
        summary: "Update help request by id",
        parameters: [{ name: "id", in: "path", required: true, description: "Help request id", schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/HelpRequest" } } }
        },
        responses: {
          "200": {
            description: "Help request updated",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/HelpRequest" } } } } }
          }
        }
      }
    },
    "/api/feedback": {
      post: {
        tags: ["Feedback"],
        summary: "Submit feedback after contextual request completion",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Feedback" } } }
        },
        responses: {
          "201": {
            description: "Feedback created and impact updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Feedback" },
                    impact: { $ref: "#/components/schemas/ImpactProfile" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/impact/{studentId}": {
      get: {
        tags: ["Impact"],
        summary: "Compute impact profile",
        parameters: [{ name: "studentId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Impact profile computed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ImpactProfile" } } }
          }
        }
      }
    },
    "/api/signals": {
      post: {
        tags: ["Signals"],
        summary: "Store weak signals, inferred preferences, and recommendation updates",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StudentSignal" } } }
        },
        responses: {
          "201": {
            description: "Signal created",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/StudentSignal" } } } } }
          }
        }
      }
    },
    "/api/admin/analytics": {
      get: {
        tags: ["Admin"],
        summary: "Return admin analytics dashboard payload",
        responses: {
          "200": {
            description: "Analytics ready",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    engagement_by_department: { type: "array", items: { type: "object" } },
                    most_requested_skills: { type: "array", items: { type: "object" } },
                    isolated_students: { type: "array", items: { type: "object" } },
                    invisible_events: { type: "array", items: { type: "object" } },
                    system_health_metrics: { type: "object" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Student: studentSchema,
      Association: associationSchema,
      Event: eventSchema,
      HelpRequest: helpRequestSchema,
      Feedback: feedbackSchema,
      StudentSignal: signalSchema,
      Recommendation: recommendationSchema,
      ImpactProfile: {
        type: "object",
        properties: {
          student_id: { type: "string", format: "uuid" },
          helped_count: { type: "integer", example: 12 },
          positive_feedback: { type: "integer", example: 11 },
          skill_confidence_score: { type: "number", example: 0.92 },
          skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                student_id: { type: "string", format: "uuid" },
                skill: { type: "string" },
                helped_count: { type: "integer" },
                positive_feedback_count: { type: "integer" },
                confidence_score: { type: "number" }
              }
            }
          }
        }
      }
    }
  }
} as const;
