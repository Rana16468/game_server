"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const behaviorAnalysis = (userId, limit = 40, page = 1) => {
    const offset = (page - 1) * limit;
    return client_1.Prisma.sql `
    WITH user_monitoring AS (
    SELECT
        m."userId",
        COUNT(DISTINCT m.country)::INTEGER AS unique_countries,
        STRING_AGG(DISTINCT m.country, ', ') AS visited_countries
    FROM "monitorings" m
    GROUP BY m."userId"
),
user_behavior_analysis AS (
    SELECT
        v."userId",
        ROUND(
            CAST(
                0.20 * (
                    COALESCE(
                        COUNT(DISTINCT v."postId")::FLOAT / 
                        NULLIF((SELECT COUNT(*)::FLOAT FROM "postratemyplates" WHERE "poststatus" = 'PUBLIC'), 0), 
                        0
                    ) * 100
                ) AS NUMERIC
            ), 
            2
        ) AS interaction_score,
        ROUND(
            CAST(
                0.15 * (
                    COALESCE(
                        COUNT(DISTINCT r.id)::FLOAT / 
                        NULLIF(COUNT(DISTINCT v."postId")::FLOAT, 0), 
                        0
                    ) * 100
                ) AS NUMERIC
            ), 
            2
        ) AS rating_engagement_score,
        ROUND(
            CAST(
                0.25 * (
                    CASE 
                        WHEN AVG(v.view) > 5 THEN 100
                        WHEN AVG(v.view) > 3 THEN 75
                        WHEN AVG(v.view) > 1 THEN 50
                        ELSE 25
                    END
                ) AS NUMERIC
            ), 
            2
        ) AS view_duration_score,
        ROUND(
            CAST(
                0.20 * (
                    COUNT(DISTINCT p."categorieId")::FLOAT / 
                    NULLIF((SELECT COUNT(*)::FLOAT FROM "foodcategorys"), 0) * 100
                ) AS NUMERIC
            ), 
            2
        ) AS category_diversity_score,
        ROUND(
            CAST(
                0.20 * (
                    COALESCE(
                        (SELECT COUNT(DISTINCT m.country)::FLOAT * 10 
                        FROM "monitorings" m 
                        WHERE m."userId" = v."userId"), 
                        0
                    )
                ) AS NUMERIC
            ), 
            2
        ) AS geographic_score
    FROM "views" v
    LEFT JOIN "postratemyplates" p ON v."postId" = p.id
    LEFT JOIN "ratings" r ON v."postId" = r."postId" AND v."userId" = r."userId"
    WHERE v."userId" = ${userId}
    GROUP BY v."userId"
),
view_statistics AS (
    SELECT
        v."postId",
        COUNT(DISTINCT v."userId")::INTEGER AS unique_viewers,
        SUM(v.view)::INTEGER AS total_views,
        (SUM(v.view) * 3)::INTEGER AS estimated_seconds_spent,
        SUM(CASE
            WHEN v."createdAt" >= NOW() - INTERVAL '24 HOURS'
            THEN v.view
            ELSE 0
        END)::INTEGER AS views_last_24h,
        SUM(CASE
            WHEN v."createdAt" >= NOW() - INTERVAL '7 DAYS'
            THEN v.view
            ELSE 0
        END)::INTEGER AS views_last_7d,
        ROUND(
            CAST((COUNT(DISTINCT v."userId")::FLOAT / NULLIF(SUM(v.view)::FLOAT, 0)) * 100 AS NUMERIC),
            2
        ) AS viewer_engagement_rate,
        ROUND(
            CAST(
                (COALESCE(
                    CAST((COUNT(DISTINCT v."userId")::FLOAT / NULLIF(SUM(v.view)::FLOAT, 0)) * 100 AS NUMERIC),
                    0
                ) * 0.4) AS NUMERIC
            ),
            2
        ) AS engagement_score,
        ROUND(
            CAST(
                (COALESCE(
                    SUM(CASE
                        WHEN v."createdAt" >= NOW() - INTERVAL '24 HOURS' THEN v.view * 1.0
                        WHEN v."createdAt" >= NOW() - INTERVAL '48 HOURS' THEN v.view * 0.8
                        WHEN v."createdAt" >= NOW() - INTERVAL '72 HOURS' THEN v.view * 0.6
                        WHEN v."createdAt" >= NOW() - INTERVAL '7 DAYS' THEN v.view * 0.4
                        ELSE v.view * 0.2
                    END),
                    0
                ) * 0.35) AS NUMERIC
            ),
            2
        ) AS time_weighted_views,
        ROUND(
            CAST(
                (COALESCE(
                    EXP(-0.1 * EXTRACT(EPOCH FROM (NOW() - MIN(v."createdAt"))) / 86400),
                    0
                ) * 0.25) AS NUMERIC
            ),
            2
        ) AS time_decay_factor,
        ROUND(
            CAST(
                (
                    COALESCE(
                        CAST((COUNT(DISTINCT v."userId")::FLOAT / NULLIF(SUM(v.view)::FLOAT, 0)) * 100 AS NUMERIC),
                        0
                    ) * 0.4 +
                    COALESCE(
                        SUM(CASE
                            WHEN v."createdAt" >= NOW() - INTERVAL '24 HOURS' THEN v.view * 1.0
                            WHEN v."createdAt" >= NOW() - INTERVAL '48 HOURS' THEN v.view * 0.8
                            WHEN v."createdAt" >= NOW() - INTERVAL '72 HOURS' THEN v.view * 0.6
                            WHEN v."createdAt" >= NOW() - INTERVAL '7 DAYS' THEN v.view * 0.4
                            ELSE v.view * 0.2
                        END) * 0.35,
                        0
                    ) +
                    COALESCE(
                        EXP(-0.1 * EXTRACT(EPOCH FROM (NOW() - MIN(v."createdAt"))) / 86400) * 0.25,
                        0
                    )
                ) AS NUMERIC
            ),
            2
        ) AS trending_score,
        ROUND(
            CAST(
                (
                    COALESCE(
                        CAST((COUNT(DISTINCT v."userId")::FLOAT / NULLIF(SUM(v.view)::FLOAT, 0)) * 100 AS NUMERIC),
                        0
                    ) * 0.6
                ) + 
                (COALESCE(SUM(v.view) * 3, 0) * 0.4) AS NUMERIC
            ),
            2
        ) AS weighted_score
    FROM "views" v
    GROUP BY v."postId"
),
user_location AS (
    SELECT 
        "userId",
        city,
        country
    FROM "monitorings"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT 1
),
user_interests AS (
    SELECT 
        p.id,
        p."categorieId",
        COALESCE(r.rating, 0)::FLOAT AS user_rating,
        COALESCE(v.view, 0)::INTEGER AS user_views
    FROM "postratemyplates" p
    LEFT JOIN "ratings" r ON p.id = r."postId" AND r."userId" = ${userId}
    LEFT JOIN "views" v ON p.id = v."postId" AND v."userId" = ${userId}
    WHERE p."poststatus" = 'PUBLIC'
),
ranked_recommendations AS (
    SELECT 
        p.*,
        'city_based' AS recommendation_type,
        1 AS display_priority,
        ROW_NUMBER() OVER (
            ORDER BY 
                COALESCE(vs.weighted_score, 0) DESC,
                COALESCE(vs.viewer_engagement_rate, 0) DESC,
                COALESCE(vs.total_views, 0) DESC
        )::INTEGER AS rank
    FROM "postratemyplates" p
    JOIN "foodcategorys" fc ON p."categorieId" = fc.id
    JOIN user_location ul ON TRUE
    LEFT JOIN view_statistics vs ON p.id = vs."postId"
    WHERE 
        p."poststatus" = 'PUBLIC' AND
        EXISTS (
            SELECT 1 FROM "monitorings" m 
            WHERE m.city = ul.city AND m."userId" = fc."userId"
        )
    
    UNION ALL
    
    SELECT 
        p.*,
        'interest_based' AS recommendation_type,
        2 AS display_priority,
        ROW_NUMBER() OVER (
            ORDER BY 
                ui.user_rating DESC,
                ui.user_views DESC,
                COALESCE(vs.weighted_score, 0) DESC
        )::INTEGER AS rank
    FROM "postratemyplates" p
    JOIN user_interests ui ON p."categorieId" = ui."categorieId"
    LEFT JOIN view_statistics vs ON p.id = vs."postId"
    WHERE p."poststatus" = 'PUBLIC'
    
    UNION ALL
    
    SELECT 
        p.*,
        'global_trending' AS recommendation_type,
        3 AS display_priority,
        ROW_NUMBER() OVER (
            ORDER BY 
                COALESCE(vs.trending_score, 0) DESC,
                COALESCE(vs.weighted_score, 0) DESC,
                COALESCE(vs.viewer_engagement_rate, 0) DESC
        )::INTEGER AS rank
    FROM "postratemyplates" p
    LEFT JOIN view_statistics vs ON p.id = vs."postId"
    WHERE p."poststatus" = 'PUBLIC'
),
combined_recommendations AS (
    SELECT *
    FROM ranked_recommendations r
    WHERE 
        (r.recommendation_type = 'city_based' AND rank <= CEIL((SELECT COUNT(*)::FLOAT * 0.4 FROM ranked_recommendations WHERE recommendation_type = 'city_based')))
        OR
        (r.recommendation_type = 'interest_based' AND rank <= CEIL((SELECT COUNT(*)::FLOAT * 0.4 FROM ranked_recommendations WHERE recommendation_type = 'interest_based'))
            AND NOT EXISTS (
                SELECT 1 FROM ranked_recommendations r2 
                WHERE r2.recommendation_type = 'city_based' 
                AND r2.id = r.id 
                AND r2.rank <= CEIL((SELECT COUNT(*)::FLOAT * 0.4 FROM ranked_recommendations WHERE recommendation_type = 'city_based'))
            ))
        OR
        (r.recommendation_type = 'global_trending' AND rank <= CEIL((SELECT COUNT(*)::FLOAT * 0.2 FROM ranked_recommendations WHERE recommendation_type = 'global_trending'))
            AND NOT EXISTS (
                SELECT 1 FROM ranked_recommendations r2 
                WHERE r2.recommendation_type IN ('city_based', 'interest_based') 
                AND r2.id = r.id 
                AND r2.rank <= CEIL((SELECT COUNT(*)::FLOAT * 0.4 FROM ranked_recommendations WHERE recommendation_type = r2.recommendation_type))
            ))
),
final_recommendations AS (
    SELECT 
        cr.*,
        ROW_NUMBER() OVER (
            PARTITION BY cr.recommendation_type
            ORDER BY cr.rank
        )::INTEGER AS type_rank
    FROM combined_recommendations cr
)
SELECT DISTINCT ON (fr.recommendation_type, fr.type_rank)
    fr.id::TEXT,
    fr."foodname",
    fr."restaurantShopName",
    fr."restaurantShopAddress",
    fr."mapLocation",
    fr."poststatus",
    fr.price::FLOAT,
    fr."opinion",
    fr."createdAt",
    fr."updatedAt",
    fc."categorieName",
    u.id::TEXT AS "userId",
    u.username,
    COUNT(DISTINCT r.id)::INTEGER AS "totalRatings",
    COALESCE(ROUND(CAST(AVG(r.rating) AS NUMERIC), 2), 0) AS "averageRating",
    COALESCE(
        JSON_AGG(
            DISTINCT ph.photo
        ) FILTER (WHERE ph.photo IS NOT NULL),
        '[]'
    ) AS photos,
    COALESCE(um.unique_countries, 0)::INTEGER AS unique_countries,
    COALESCE(um.visited_countries, '') AS visited_countries,
    COALESCE(vs.unique_viewers, 0)::INTEGER AS unique_viewers,
    COALESCE(vs.total_views, 0)::INTEGER AS total_views,
    COALESCE(vs.views_last_24h, 0)::INTEGER AS views_last_24h,
    COALESCE(vs.views_last_7d, 0)::INTEGER AS views_last_7d,
    COALESCE(vs.viewer_engagement_rate, 0)::FLOAT AS viewer_engagement_rate,
    COALESCE(vs.estimated_seconds_spent, 0)::INTEGER AS estimated_time_spent_seconds,
    COALESCE(vs.weighted_score, 0)::FLOAT AS weighted_score,
    COALESCE(vs.trending_score, 0)::FLOAT AS trending_score,
    COALESCE(vs.engagement_score, 0)::FLOAT AS engagement_score,
    COALESCE(vs.time_weighted_views, 0)::FLOAT AS time_weighted_views,
    COALESCE(vs.time_decay_factor, 0)::FLOAT AS time_decay_factor,
    COALESCE(uba.interaction_score, 0)::FLOAT AS user_interaction_score,
    COALESCE(uba.rating_engagement_score, 0)::FLOAT AS user_rating_engagement,
    COALESCE(uba.view_duration_score, 0)::FLOAT AS user_view_duration_score,
    COALESCE(uba.category_diversity_score, 0)::FLOAT AS user_category_diversity,
    COALESCE(uba.geographic_score, 0)::FLOAT AS user_geographic_score,
    ROUND(
        CAST(
            COALESCE(
                uba.interaction_score +
                uba.rating_engagement_score +
                uba.view_duration_score +
                uba.category_diversity_score +
                uba.geographic_score,
                0
            ) AS NUMERIC
        ),
        2
    )::FLOAT AS total_behavior_score,
    fr.recommendation_type,
    fr.display_priority::INTEGER,
    fr.rank::INTEGER
    FROM final_recommendations fr
JOIN "foodcategorys" fc ON fr."categorieId" = fc.id
JOIN "users" u ON fc."userId" = u.id
LEFT JOIN "ratings" r ON fr.id = r."postId"
LEFT JOIN "photos" ph ON fr.id = ph."postId"
LEFT JOIN user_monitoring um ON u.id = um."userId"
LEFT JOIN view_statistics vs ON fr.id = vs."postId"
LEFT JOIN user_behavior_analysis uba ON uba."userId" = ${userId}
GROUP BY 
    fr.id,
    fr."foodname",
    fr."restaurantShopName",
    fr."restaurantShopAddress",
    fr."mapLocation",
    fr."poststatus",
    fr.price,
    fr."opinion",
    fr."createdAt",
    fr."updatedAt",
    fc."categorieName",
    u.id,
    u.username,
    um.unique_countries,
    um.visited_countries,
    vs.unique_viewers,
    vs.total_views,
    vs.views_last_24h,
    vs.views_last_7d,
    vs.viewer_engagement_rate,
    vs.estimated_seconds_spent,
    vs.weighted_score,
    vs.trending_score,
    vs.engagement_score,
    vs.time_weighted_views,
    vs.time_decay_factor,
    fr.recommendation_type,
    fr.display_priority,
    fr.rank,
    fr.type_rank,
    uba.interaction_score,
    uba.rating_engagement_score,
    uba.view_duration_score,
    uba.category_diversity_score,
    uba.geographic_score
ORDER BY 
    fr.recommendation_type,
    fr.type_rank,
    fr.display_priority
    LIMIT ${limit}
    OFFSET ${offset};
  `;
};
const behaviorAnalysisQuery = {
    behaviorAnalysis,
};
exports.default = behaviorAnalysisQuery;
