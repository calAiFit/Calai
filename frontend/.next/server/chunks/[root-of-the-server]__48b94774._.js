module.exports = [
"[project]/.next-internal/server/app/api/workouts/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db,
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error",
        "warn"
    ] : "TURBOPACK unreachable",
    errorFormat: "pretty"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
const db = {
    async getProfileByUserId (userId) {
        return prisma.profile.findUnique({
            where: {
                userId
            }
        });
    },
    async upsertProfile (userId, data) {
        return prisma.profile.upsert({
            where: {
                userId
            },
            update: data,
            create: {
                userId,
                name: data.name,
                avatarUrl: data.avatarUrl,
                ...data.age && {
                    age: data.age
                },
                ...data.gender && {
                    gender: data.gender
                },
                ...data.height && {
                    height: data.height
                },
                ...data.weight && {
                    weight: data.weight
                },
                ...data.targetWeight && {
                    targetWeight: data.targetWeight
                },
                ...data.activityLevel && {
                    activityLevel: data.activityLevel
                }
            }
        });
    },
    async getDailyGoal (userId, date) {
        return prisma.dailyGoal.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: new Date(date.toDateString())
                }
            }
        });
    },
    async upsertDailyGoal (userId, date, data) {
        return prisma.dailyGoal.upsert({
            where: {
                userId_date: {
                    userId,
                    date: new Date(date.toDateString())
                }
            },
            update: data,
            create: {
                userId,
                date: new Date(date.toDateString()),
                ...data
            }
        });
    },
    async addIntakeHistory (userId, data) {
        const intakeRecord = await prisma.dailyIntakeHistory.create({
            data: {
                userId,
                date: new Date(),
                ...data
            }
        });
        await this.updateDailySummary(userId);
        return intakeRecord;
    },
    async getIntakeHistory (userId, date) {
        const targetDate = date || new Date();
        return prisma.dailyIntakeHistory.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(targetDate.toDateString()),
                    lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1))
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    },
    async addWorkout (userId, data) {
        return prisma.workout.create({
            data: {
                userId,
                date: new Date(),
                ...data
            }
        });
    },
    async getWorkouts (userId, limit = 10) {
        return prisma.workout.findMany({
            where: {
                userId
            },
            orderBy: {
                date: "desc"
            },
            take: limit
        });
    },
    async addFoodRecognition (userId, data) {
        return prisma.foodRecognition.create({
            data: {
                userId,
                ...data
            }
        });
    },
    async getFoodRecognitions (userId, limit = 10) {
        return prisma.foodRecognition.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit
        });
    },
    async getWeeklyIntakeSummary (userId) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return prisma.dailyIntakeHistory.groupBy({
            by: [
                "date"
            ],
            where: {
                userId,
                date: {
                    gte: weekAgo
                }
            },
            _sum: {
                calories: true,
                protein: true,
                carbs: true,
                fats: true
            },
            orderBy: {
                date: "asc"
            }
        });
    },
    async getMonthlyWorkoutSummary (userId) {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return prisma.workout.findMany({
            where: {
                userId,
                date: {
                    gte: monthAgo
                }
            },
            orderBy: {
                date: "desc"
            }
        });
    },
    async addBurnedCalories (userId, data) {
        const today = new Date();
        return prisma.dailyBurnedCalories.upsert({
            where: {
                userId_date_activity: {
                    userId,
                    date: new Date(today.toDateString()),
                    activity: data.activity
                }
            },
            update: {
                calories: {
                    increment: data.calories
                },
                duration: data.duration ? {
                    increment: data.duration
                } : undefined
            },
            create: {
                userId,
                date: new Date(today.toDateString()),
                ...data
            }
        });
    },
    async getBurnedCalories (userId, date) {
        const targetDate = date || new Date();
        return prisma.dailyBurnedCalories.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(targetDate.toDateString()),
                    lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1))
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    },
    async getTotalBurnedCalories (userId, date) {
        const targetDate = date || new Date();
        const result = await prisma.dailyBurnedCalories.aggregate({
            where: {
                userId,
                date: {
                    gte: new Date(targetDate.toDateString()),
                    lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1))
                }
            },
            _sum: {
                calories: true
            }
        });
        return result._sum.calories || 0;
    },
    async getDailySummary (userId, date) {
        const targetDate = date || new Date();
        return prisma.dailySummary.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: new Date(targetDate.toDateString())
                }
            }
        });
    },
    async updateDailySummary (userId, date) {
        const targetDate = date || new Date();
        const dateStr = new Date(targetDate.toDateString());
        const consumedResult = await prisma.dailyIntakeHistory.aggregate({
            where: {
                userId,
                date: {
                    gte: dateStr,
                    lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1))
                }
            },
            _sum: {
                calories: true,
                protein: true,
                carbs: true,
                fats: true
            }
        });
        const burnedResult = await prisma.dailyBurnedCalories.aggregate({
            where: {
                userId,
                date: {
                    gte: dateStr,
                    lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1))
                }
            },
            _sum: {
                calories: true
            }
        });
        const totalConsumed = consumedResult._sum.calories || 0;
        const totalBurned = burnedResult._sum.calories || 0;
        const netCalories = totalConsumed - totalBurned;
        return prisma.dailySummary.upsert({
            where: {
                userId_date: {
                    userId,
                    date: dateStr
                }
            },
            update: {
                totalConsumed,
                totalBurned,
                netCalories,
                protein: consumedResult._sum.protein || 0,
                carbs: consumedResult._sum.carbs || 0,
                fats: consumedResult._sum.fats || 0
            },
            create: {
                userId,
                date: dateStr,
                totalConsumed,
                totalBurned,
                netCalories,
                protein: consumedResult._sum.protein || 0,
                carbs: consumedResult._sum.carbs || 0,
                fats: consumedResult._sum.fats || 0
            }
        });
    },
    async getHistoricalData (userId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return prisma.dailySummary.findMany({
            where: {
                userId,
                date: {
                    gte: startDate
                }
            },
            orderBy: {
                date: "desc"
            }
        });
    },
    async resetDailyData (userId, date) {
        await this.updateDailySummary(userId, date);
    },
    async getWeightEntries (profileId) {
        console.log("Fetching weight entries for profileId:", profileId);
        const result = await prisma.weightEntry.findMany({
            where: {
                profileId
            },
            orderBy: {
                date: "asc"
            }
        });
        console.log("Found weight entries:", result.length);
        return result;
    },
    async addWeightEntry (profileId, weight) {
        console.log("Adding weight entry to database:", {
            profileId,
            weight
        });
        const result = await prisma.weightEntry.create({
            data: {
                profileId,
                weight,
                date: new Date()
            }
        });
        console.log("Weight entry created:", result);
        return result;
    }
};
const __TURBOPACK__default__export__ = prisma;
}),
"[project]/src/app/api/workouts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$server$2f$createGetAuth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/nextjs/dist/esm/server/createGetAuth.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/dist/esm/v3/index.js [app-route] (ecmascript)");
;
;
;
;
const workoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().min(1).max(1440),
    calories: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().min(0).max(10000),
    exercises: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).min(1),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional()
});
async function GET(req) {
    const { userId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$server$2f$createGetAuth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])(req);
    if (!userId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const workouts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].getWorkouts(userId, limit);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            workouts
        });
    } catch (error) {
        console.error("GET /api/workouts error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch workouts"
        }, {
            status: 500
        });
    }
}
async function POST(req) {
    const { userId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$server$2f$createGetAuth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])(req);
    if (!userId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    try {
        const body = await req.json();
        const validatedData = workoutSchema.parse(body);
        const workout = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].addWorkout(userId, validatedData);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            workout
        });
    } catch (error) {
        console.error("POST /api/workouts error:", error);
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].ZodError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid input data",
                details: error.errors
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to add workout"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__48b94774._.js.map