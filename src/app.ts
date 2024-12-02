import express from "express";
import path from "path";

import { Orders, Persons, sequelize } from "./db";
import { Transaction, TransactionOptions } from "sequelize";
import { loggingMiddleWare } from "./middleware";

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
app.use("/static", express.static("public"));
app.use("/", loggingMiddleWare);
const port = 5001;

const reset = async () => {
  await Persons.update({ name: "john" }, { where: { id: 1 } });
  await Orders.update({ OrderNumber: 100 }, { where: { id: 1 } });
};

const checkIsolation = async (
  t1options: TransactionOptions,
  t2options: TransactionOptions,
  log: (s: string | (number | string)[]) => void
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
      transaction: t1
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
      transaction: t2
    });

    const order = await Orders.findOne({
      where: { id: 1 },
      transaction: t2,
    });

    await order.update(
      { OrderNumber: -100 },
      {
        transaction: t2,
      }
    );

    log([
      personInTransaction.name,
      samePerson?.name,
      t2options.isolationLevel,
      t2options.type,
    ]);

    await t1.commit();
    await t2.commit();
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    return error;
  }
};

// update in transaction
app.get("/", async (req, res) => {
  res.log([
    "personInTransaction",
    "samePerson",
    "isolation level t2",
    "type t2",
  ]);
  res.log(["-----", "-----", "-----", "-----"]);
  await reset();
  const isolationLevel: Transaction.ISOLATION_LEVELS =
    req.query.isolationLevel ?? Transaction.ISOLATION_LEVELS.REPEATABLE_READ;
  const type: Transaction.TYPES = req.query.type ?? Transaction.TYPES.DEFERRED;
  /** we read john when our update transaction is read commited */
  const error = await checkIsolation(
    {
      isolationLevel,
      type
    },
    {
      isolationLevel,
      type,
    },
    res.log
  );
  await reset();
  res.html({
    error,
    isolationLevelOptions: [
      "READ UNCOMMITTED",
      "READ COMMITTED",
      "REPEATABLE READ",
      "SERIALIZABLE",
    ],
    typeOptions: ["DEFERRED", "IMMEDIATE", "EXCLUSIVE"],
    isolationLevel,
    type,
  });
});

app.listen(port, async () => {
  /** reset to john when restarted */
  await reset();
  return console.log(`Express is listening at http://localhost:${port}`);
});
