-- CreateTable
CREATE TABLE "users" (
    "userId" INTEGER NOT NULL,
    "username" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "rankings" (
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "highScore" INTEGER NOT NULL,
    "monthly" INTEGER NOT NULL,
    "lastMonth" INTEGER NOT NULL,
    "daily" INTEGER NOT NULL,
    "yesterDay" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,

    CONSTRAINT "rankings_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
