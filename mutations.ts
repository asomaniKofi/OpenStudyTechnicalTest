/**

mutation {
  login(username: "testadmin", password: "password123")
}

query GetCourses($limit: Int, $sortOrder: SortOrder) {
  courses(limit: $limit, sortOrder: $sortOrder) {
    id
    title
    description
    duration
    outcome
  }
}

query GetCourse {
  course(id: "1") {
    id
    title
    description
    duration
    outcome
  }
}

query GetCollections {
  collections {
    id
    name
    courses {
      id
      title
      description
      duration
      outcome
    }
  }
}

mutation {
  addCourse(input: {
    title: "GraphQL Basics",
    description: "Learn GraphQL from scratch",
    duration: "3 hours",
    outcome: "Build a basic GraphQL API"
  }) {
    id
    title
  }
}

mutation AddCourse {
  addCourse(input: {
    title: "OpenStudyCollege Basics",
    description: "Learn GraphQL from fire",
    duration: "2 hours",
    outcome: "Build a basic GraphQL API"
  }) {
    id
    title
    description
    duration
    outcome
  }
}

mutation UpdateCourse {
  updateCourse(id: "2", input: {
    title: "OpenStudyCollege Basics",
    description: "Learn GraphQL from fire",
    duration: "2 hours",
    outcome: "Build a basic GraphQL API using TypeScript"
  }) {
    id
    title
    description
    duration
    outcome
  }
}


mutation {
  register(username: "testedadmin", password: "password123", role:"ADMIN") {
    id
    username
    role
  }
}

mutation {
  register(username: "student", password: "password123", role:"USER") {
    id
    username
    role
  }
}


*/