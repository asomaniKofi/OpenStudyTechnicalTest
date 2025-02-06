import  {ApolloServer}  from 'apollo-server';
import * as  gql from 'graphql-tag';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

interface User {
  userId: number;
  role: string;
}

interface Context {
  user?: User;
}

// GraphQL Schema Definition
const typeDefs = gql.default.default`
  enum SortOrder {
    ASC
    DESC
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    duration: String!
    outcome: String!
  }

  type Collection {
    id: ID!
    name: String!
    courses: [Course!]!
  }

  type User {
    id: ID!
    username: String!
    role: String!
  }

  type Query {
    courses(limit: Int, sortOrder: SortOrder): [Course!]!
    course(id: ID!): Course
    collections: [Collection!]!
    collection(id: ID!): Collection
  }

  input CourseInput {
    title: String!
    description: String!
    duration: String!
    outcome: String!
  }

  type Mutation {
    addCourse(input: CourseInput!): Course
    updateCourse(id: ID!, input: CourseInput!): Course
    deleteCourse(id: ID!): Boolean

    register(username: String!, password: String!): User
    login(username: String!, password: String!): String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    courses: async (_: unknown, { limit, sortOrder }: { limit?: number; sortOrder?: 'ASC' | 'DESC' }) => {
      return await prisma.course.findMany({
        take: limit,
        orderBy: { title: sortOrder === 'ASC' ? 'asc' : 'desc' },
      });
    },
    course: async (_: unknown, { id }: { id: string }) => {
      return await prisma.course.findUnique({ where: { id: parseInt(id) } });
    },
    collections: async () => {
      return await prisma.collection.findMany({ include: { courses: true } });
    },
    collection: async (_: unknown, { id }: { id: string }) => {
      return await prisma.collection.findUnique({
        where: { id: parseInt(id) },
        include: { courses: true },
      });
    },
  },
  Mutation: {
    addCourse: async (_: unknown, { input }: { input: any }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      if (context.user.role !== 'ADMIN') throw new Error('Not authorized');
      return await prisma.course.create({ data: input });
    },
    updateCourse: async (_: unknown, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      const course = await prisma.course.findUnique({ where: { id: parseInt(id) } });
      if (!course) throw new Error('Course not found');
      if (context.user.role !== 'ADMIN' && context.user.userId !== course.userId) throw new Error('Not authorized');
      return await prisma.course.update({ where: { id: parseInt(id) }, data: input });
    },
    deleteCourse: async (_: unknown, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error('Not authenticated');
      const course = await prisma.course.findUnique({ where: { id: parseInt(id) } });
      if (!course) throw new Error('Course not found');
      if (context.user.role !== 'ADMIN' && context.user.userId !== course.userId) throw new Error('Not authorized');
      await prisma.course.delete({ where: { id: parseInt(id) } });
      return true;
    },
    register: async (_: unknown, { username, password, role }: { username: string; password: string, role:string }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return await prisma.user.create({
        data: { username, password: hashedPassword, role: role },
      });
    },
    login: async (_: unknown, { username, password }: { username: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
      }
      return jwt.sign({ userId: user.userId, role: user.role }, JWT_SECRET);
    },
  },
};

// JWT Authentication
const context: ContextFunction<ExpressContext, Context> = ({ req }) => {
  const token = req.headers.authorization || '';
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as User;
      return { user: decoded };
    } catch (e) {
      throw new Error('Invalid token');
    }
  }
  return {};
};

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers, context });

// Start Server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});