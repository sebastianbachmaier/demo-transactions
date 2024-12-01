import express from "express";
import path from "path";

import { Persons, sequelize } from "./db";
import { Transaction } from "sequelize";
import { marked } from "marked";

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
app.use("/static", express.static("public"));
const port = 5001;

const checkIsolation = async (
  isolationLevel: Transaction.ISOLATION_LEVELS,
  type: Transaction.TYPES,
  log: (s: string | string[]) => void
) => {
  /* create transaction with isolation Level */
  const t1 = await sequelize.transaction({
    isolationLevel,
    type,
  });

  try {
    /* update person */
    const personInTransaction = await Persons.findOne({
      where: {
        id: 1,
      },
      transaction: t1,
    });

    await personInTransaction.update(
      { name: "Updated John" },
      {
        transaction: t1,
      }
    );

    /* get the same person but before it's committed */
    const samePerson = await Persons.findOne({
      where: { id: 1 },
    });

    log([personInTransaction.name, samePerson?.name]);

    await t1.commit();
  } catch (error) {
    await t1.rollback();
  }
};

const reset = async () => {
  await Persons.update({ name: "john" }, { where: { id: 1 } });
};

/* setup some logging */
app.use("/", async (_req, res, next) => {
  /** setup some logging */
  res.logging = "";
  res.log = (s: string | string[]) => {
    if (Array.isArray(s)) {
      s = `| ${s.join(" | ")}`;
    }
    res.logging += `${s}\n`;
  };

  app.get("/", (req, res) => {
    res.render("index");
  });
  res.html = () => {
    res.render("index",{
      content: marked.parse(res.logging)
    });
  };
  next();
});

app.get("/", async (_req, res) => {
  const person = await Persons.findOne({ where: { id: 1 } });
  res.send(`Hello ${person?.name}!`);
});

// update in transaction
app.get("/update", async (_req, res) => {
  res.log(["transaction", "without transaction"]);
  res.log(["-----", "-----"]);
  await reset();
  /** we read john when our update transaction is read commited */
  await checkIsolation(
    Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    Transaction.TYPES.DEFERRED,
    res.log
  );
  await reset();
  res.html();
});

app.get("/reset", async (_req, res) => {
  await Persons.update({ name: "john" }, { where: { id: 1 } });
  res.send("Reset");
});



app.listen(port, async () => {
  /** reset to john when restarted */
  await reset();
  return console.log(`Express is listening at http://localhost:${port}`);
});
