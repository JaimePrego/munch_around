-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prepTime" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "mainProtein" TEXT NOT NULL,
    "healthScore" REAL NOT NULL,
    "preferenceScore" REAL NOT NULL,
    "defaultPortions" INTEGER NOT NULL DEFAULT 2,
    "imageUrl" TEXT,
    "ingredients" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStartDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME
);

-- CreateTable
CREATE TABLE "MealSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklyPlanId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "slotType" TEXT NOT NULL,
    "mealId" TEXT,
    "portions" INTEGER NOT NULL DEFAULT 2,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "score" REAL,
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealSlot_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealSlot_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealId" TEXT NOT NULL,
    "eatenDate" DATETIME NOT NULL,
    "slotType" TEXT NOT NULL,
    "weeklyPlanId" TEXT,
    "portions" INTEGER NOT NULL DEFAULT 2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealHistory_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MealHistory_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlannerSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "defaultSlotConfig" TEXT NOT NULL,
    "preferenceWeight" REAL NOT NULL DEFAULT 3,
    "healthWeight" REAL NOT NULL DEFAULT 2,
    "freshnessWeight" REAL NOT NULL DEFAULT 3,
    "varietyWeight" REAL NOT NULL DEFAULT 2,
    "prepSuitabilityWeight" REAL NOT NULL DEFAULT 2,
    "varietyStrictness" REAL NOT NULL DEFAULT 1,
    "freshnessPenaltyStrength" REAL NOT NULL DEFAULT 1,
    "maxLongPrepMealsPerWeek" INTEGER NOT NULL DEFAULT 2,
    "preferLongMealsOnWeekends" BOOLEAN NOT NULL DEFAULT true,
    "targetAverageHealthScore" REAL NOT NULL DEFAULT 7
);
