var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApolloServer } from 'apollo-server';
import * as gql from 'graphql-tag';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const typeDefs = gql.default.default `
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
const resolvers = {
    Query: {
        courses: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { limit, sortOrder }) {
            return yield prisma.course.findMany({
                take: limit,
                orderBy: { title: sortOrder === 'ASC' ? 'asc' : 'desc' },
            });
        }),
        course: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            return yield prisma.course.findUnique({ where: { id: parseInt(id) } });
        }),
        collections: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield prisma.collection.findMany({ include: { courses: true } });
        }),
        collection: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            return yield prisma.collection.findUnique({
                where: { id: parseInt(id) },
                include: { courses: true },
            });
        }),
    },
    Mutation: {
        addCourse: (_1, _a, context_1) => __awaiter(void 0, [_1, _a, context_1], void 0, function* (_, { input }, context) {
            if (!context.user)
                throw new Error('Not authenticated');
            if (context.user.role !== 'ADMIN')
                throw new Error('Not authorized');
            return yield prisma.course.create({ data: input });
        }),
        updateCourse: (_1, _a, context_1) => __awaiter(void 0, [_1, _a, context_1], void 0, function* (_, { id, input }, context) {
            if (!context.user)
                throw new Error('Not authenticated');
            const course = yield prisma.course.findUnique({ where: { id: parseInt(id) } });
            if (!course)
                throw new Error('Course not found');
            if (context.user.role !== 'ADMIN' && context.user.userId !== course.userId)
                throw new Error('Not authorized');
            return yield prisma.course.update({ where: { id: parseInt(id) }, data: input });
        }),
        deleteCourse: (_1, _a, context_1) => __awaiter(void 0, [_1, _a, context_1], void 0, function* (_, { id }, context) {
            if (!context.user)
                throw new Error('Not authenticated');
            const course = yield prisma.course.findUnique({ where: { id: parseInt(id) } });
            if (!course)
                throw new Error('Course not found');
            if (context.user.role !== 'ADMIN' && context.user.userId !== course.userId)
                throw new Error('Not authorized');
            yield prisma.course.delete({ where: { id: parseInt(id) } });
            return true;
        }),
        register: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { username, password }) {
            const hashedPassword = yield bcrypt.hash(password, 10);
            return yield prisma.user.create({
                data: { username, password: hashedPassword, role: 'ADMIN' },
            });
        }),
        login: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { username, password }) {
            const user = yield prisma.user.findUnique({ where: { username } });
            if (!user || !(yield bcrypt.compare(password, user.password))) {
                throw new Error('Invalid credentials');
            }
            return jwt.sign({ userId: user.userId, role: user.role }, JWT_SECRET);
        }),
    },
};
const context = ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return { user: decoded };
        }
        catch (e) {
            throw new Error('Invalid token');
        }
    }
    return {};
};
const server = new ApolloServer({ typeDefs, resolvers, context });
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
//# sourceMappingURL=index.js.map