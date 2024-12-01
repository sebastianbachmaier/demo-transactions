import express from "express";
import path from "path";

import { Persons, sequelize } from "./db";
import { Deferrable, Transaction, TransactionOptions } from "sequelize";
import { loggingMiddleWare } from "./middleware";

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
app.use("/static", express.static("public"));
app.use("/", loggingMiddleWare);
const port = 5001;

const reset = async () => {
  await Persons.update({ name: "john" }, { where: { id: 1 } });
};

const checkIsolation = async (
  t1options: TransactionOptions,
  t2options: TransactionOptions,
  log: (s: string | string[]) => void
) => {
  /* create transaction with isolation Level */
  const t1 = await sequelize.transaction(t1options);
  const t2 = await sequelize.transaction(t2options);

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
      transaction: t2,
    });

    log([
      personInTransaction.name,
      samePerson?.name,
      t2options.isolationLevel,
      t2options.type,
    ]);

    await t1.commit();
  } catch (error) {
    await t1.rollback();
  }
};

// update in transaction
app.get("/", async (req, res) => {
  res.log([
    "transaction",
    "without transaction",
    "isolation level t2",
    "type t2",
  ]);
  res.log(["-----", "-----", "-----", "-----"]);
  await reset();
  const isolationLevel: Transaction.ISOLATION_LEVELS =
    req.query.isolationLevel ?? Transaction.ISOLATION_LEVELS.REPEATABLE_READ;
  const type: Transaction.TYPES = req.query.type ?? Transaction.TYPES.DEFERRED;
  /** we read john when our update transaction is read commited */
  await checkIsolation(
    {
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
      type: Transaction.TYPES.DEFERRED,
    },
    {
      isolationLevel,
      type,
    },
    res.log
  );
  await reset();
  res.html({
    isolationLevelOptions: [
      "READ UNCOMMITTED",
      "READ COMMITTED",
      "REPEATABLE READ",
      "SERIALIZABLE",
    ],
    typeOptions: ['DEFERRED', 'IMMEDIATE', 'EXCLUSIVE'],
    isolationLevel,
    type,
  });
});

app.listen(port, async () => {
  /** reset to john when restarted */
  await reset();
  return console.log(`Express is listening at http://localhost:${port}`);
});
