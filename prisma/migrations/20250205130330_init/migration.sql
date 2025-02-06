-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('ASC', 'DESC');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
