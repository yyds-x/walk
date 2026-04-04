---
name: pm
description: 产品/项目管理技能合集（PRD、评审、路线图、优先级、埋点、复盘、数据分析、问卷等）。当用户提到需求文档/评审/排期/里程碑/埋点/复盘/数据分析/调研等场景时使用，并路由到对应子技能。
description_en: Product & project management skill bundle (PRD, review, roadmap, prioritization, tracking, postmortem, analytics, survey). Invoke for PM tasks and route to the matching sub-skill.
version: 1.0.0
---

# PM Skill Bundle

## Source

本技能的子技能源文件位于：`.agents/skills/pm/`

## Routing

在执行前先判断用户意图，并阅读对应子技能的 `SKILL.md`：

- 数据分析/指标归因/漏斗留存：`.agents/skills/pm/pm-analytics/`
- 竞品拆解：`.agents/skills/pm/pm-competitor-deconstructor/`
- 实验设计/A-B：`.agents/skills/pm/pm-experiment-designer/`
- 截图复刻为 Pencil：`.agents/skills/pm/pm-image2pencil/`
- 截图复刻为 HTML 原型：`.agents/skills/pm/pm-image2proto/`
- 上线复盘/事故复盘：`.agents/skills/pm/pm-postmortem-writer/`
- PRD 需求文档：`.agents/skills/pm/pm-prd-writer/`
- 优先级排序（RICE/ICE/Kano）：`.agents/skills/pm/pm-prioritization-engine/`
- 多角色评审会：`.agents/skills/pm/pm-review-board/`
- 版本规划/路线图：`.agents/skills/pm/pm-roadmap-planner/`
- 调研问卷设计：`.agents/skills/pm/pm-survey-designer/`
- 埋点方案/指标口径：`.agents/skills/pm/pm-tracking-spec-writer/`
- URL 克隆为 Web 原型：`.agents/skills/pm/pm-url2proto/`
