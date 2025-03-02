-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "prepTime" TEXT NOT NULL DEFAULT '0',
    "cookTime" TEXT NOT NULL DEFAULT '0',
    "servings" TEXT NOT NULL DEFAULT '1',
    "difficulty" TEXT NOT NULL DEFAULT 'EASY',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("cookTime", "createdAt", "difficulty", "id", "instructions", "prepTime", "servings", "title", "updatedAt", "userId") SELECT "cookTime", "createdAt", "difficulty", "id", "instructions", "prepTime", "servings", "title", "updatedAt", "userId" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
