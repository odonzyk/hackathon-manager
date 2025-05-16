const express = require("express");
const { db_get, db_run, db_all } = require("../database");
const logger = require("../logger");

const authenticateToken = require("../middlewares/authMiddleware");
const router = express.Router();
const { ErrorMsg } = require("../constants");

const createProject = (dbRow) => {
  return {
    event_id: dbRow?.event_id ?? null,
    id: dbRow?.id ?? null,
    status_id: dbRow?.status_id ?? 1,
    idea: dbRow?.idea ?? "",
    description: dbRow?.description ?? "",
    team_name: dbRow?.team_name ?? "",
    team_avatar_url: dbRow?.team_avatar_url ?? "",
    iniator_id: dbRow?.iniator_id ?? null,
    goal: dbRow?.goal ?? "",
    components: dbRow?.components ?? "",
    skills: dbRow?.skills ?? "",
  };
};

// *** GET /api/project/list *****************************************************
router.get("/list", authenticateToken, async (req, res) => {
  logger.debug(`API Project -> List Projects`);
  const result = await db_all(`SELECT Project.* FROM Project`);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }
  // Wandle jedes DB-Row-Objekt in ein Project-Objekt mit createProject()
  const projects = result.row.map(createProject);
  res.json(projects);
});

// *** GET /api/project/listByUser/:id **********************************************
router.get("/listByUser/:id", authenticateToken, async (req, res) => {
  logger.debug(`API Project -> List my participate projects`);
  const { id } = req.params;
  if (!id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  const result = await db_all(
    `SELECT Project.* FROM Project JOIN Participant ON Project.id = Participant.project_id WHERE Participant.user_id = ?`,
    [id],
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }
  // Wandle jedes DB-Row-Objekt in ein Project-Objekt mit createProject()
  const projects = result.row.map(createProject);
  res.json(projects);
});

// *** POST /api/project *********************************************************
router.post("/", async (req, res) => {
  let {
    event_id,
    status_id,
    idea,
    description,
    team_name,
    team_avatar_url,
    iniator_id,
    goal,
    components,
    skills,
  } = req.body;
  logger.debug(`API Event -> Register Project: ${event_id}`);
  if (!event_id || !idea || !description || !iniator_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  let result = await db_get(
    "SELECT * FROM Project WHERE LOWER(idea) = LOWER(?) AND event_id= ?",
    [idea, event_id],
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  result = await db_run(
    "INSERT INTO Project (event_id, status_id, idea, description, team_name, team_avatar_url, iniator_id, goal, components, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      event_id,
      status_id,
      idea,
      description,
      team_name,
      team_avatar_url,
      iniator_id,
      goal,
      components,
      skills,
    ],
  );
  const project_id = result.lastID;
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(201).json({
    event_id,
    id: project_id,
    status_id,
    idea,
    description,
    team_name,
    team_avatar_url,
    iniator_id,
    goal,
    components,
    skills,
  });
});

// *** PUT /api/event *********************************************************
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  let {
    event_id,
    status_id,
    idea,
    description,
    team_name,
    team_avatar_url,
    iniator_id,
    goal,
    components,
    skills,
  } = req.body;
  logger.debug(`API Project -> Update Project: ${idea}`);

  if (!event_id || !idea || !description || !iniator_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  result = await db_get(`SELECT * FROM Project WHERE Project.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_EVENT);

  let project = createProject(result.row);

  // Check if event name is used by someone already
  if (project.idea != idea) {
    let result = await db_get(
      "SELECT * FROM Project WHERE LOWER(idea) = LOWER(?) AND id != ? AND event_id = ?",
      [idea, id, event_id],
    );
    if (result.err) {
      return res.status(500).send(ErrorMsg.SERVER.ERROR);
    }
    if (result.row) {
      return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
    }
  }
  project.event_id = event_id ?? project.event_id;
  project.status_id = status_id ?? project.status_id;
  project.idea = idea ?? project.idea;
  project.description = description ?? project.description;
  project.team_name = team_name ?? project.team_name;
  project.team_avatar_url = team_avatar_url ?? project.team_avatar_url;
  project.iniator_id = iniator_id ?? project.iniator_id;
  project.goal = goal ?? project.goal;
  project.components = components ?? project.components;
  project.skills = skills ?? project.skills;

  // Update Project
  result = await db_run(
    "UPDATE Project SET event_id=?, status_id=?, idea=?, description=?, team_name=?, team_avatar_url=?, iniator_id=?, goal=?, components=?, skills=? WHERE id = ?",
    [
      project.event_id,
      project.status_id,
      project.idea,
      project.description,
      project.team_name,
      project.team_avatar_url,
      project.iniator_id,
      project.goal,
      project.components,
      project.skills,
      id,
    ],
  );
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(200).json(project);
});

// *** GET /api/project *********************************************************
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Project -> Get Project (id): ${id}`);

  const result = await db_get(`SELECT * FROM Project WHERE Project.id = ?`, [
    id,
  ]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  const project = createProject(result.row);
  res.json(project);
});

// *** DELETE /api/project *********************************************************
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Project -> Delete Project (id): ${id}`);

  result = await db_run("DELETE FROM Project WHERE id = ?", [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }
  res.status(200).send("Project deleted successfully");
});

module.exports = router;
