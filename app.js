const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let database = null;

const initializerDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializerDbAndServer();

//API 1;

const ConvertMoviesDbAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (Request, Response) => {
  const getMoviesInQuery = `SELECT movie_name FROM movie;`;
  const getmovieResponce = await database.all(getMoviesInQuery);
  Response.send(
    getmovieResponce.map((eachItem) => ConvertMoviesDbAPI1(eachItem))
  );
});

//API 2;

app.post("/movies/", async (Request, Response) => {
  const { directorId, movieName, leadActor } = Request.body;
  const createMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(
          '${directorId}',
          '${movieName}',
          '${leadActor}'
        );`;
  const createMovieQueryResponse = await database.run(createMovieQuery);
  Response.send("Movie Successfully Added");
});

//API #;

const convertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (Request, Response) => {
  const { movieId } = Request.params;
  const getMoviedetailsQuery = `SELECT * FROM movie 
    WHERE movie_id = ${movieId}`;
  const getMoviedetailsResponse = await database.get(getMoviedetailsQuery);
  Response.send(convertMovieDbAPI3(getMoviedetailsResponse));
});

//API 4;

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5;

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id =${movieId};`;
  const deleteMovieQueryResponse = await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6;

const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director;`;
  const getDirectorsQueryResponse = await database.all(getDirectorsQuery);
  response.send(
    getDirectorsQueryResponse.map((eachItem) => convertDirectorDbAPI6(eachItem))
  );
});

//API 7;

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `select movie_name as movieName from movie where 
  director_id = ${directorId};`;
  const getMoviesByDirectorQueryResponse = await database.all(
    getMoviesByDirectorQuery
  );
  response.send(getMoviesByDirectorQueryResponse);
});

module.exports = app;
