
# Sequelize Transaction Sandbox 
Try out how sequelize transaction parameters influence when transactions lock and when they modify what.

Sequelize transaction return different things depent on your isolation level:
- `READ UNCOMMITTED` - Makes it possible to read uncommitted changes from other transactions.
- `READ COMMITTED` - Reads only changes that are commited from other transaction
- `REPEATABLE READ` - If something has been read then you will read the same again even though it might be changed in another transaction
- `SERIALIZABLE` - Locks the rows, so if another transaction reads it it will be locked until the first transaction is done (might be succesible to deadlocks)


This project is a sandbox to see how that works in a real live application.


## Code
```typescript
const t1 = await sequelize.transaction(t1options);
const t2 = await sequelize.transaction(t2options);

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

const samePerson = await Persons.findOne({
  where: { id: 1 },
  transaction: t2,
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

await t1.commit();
await t2.commit();
```

## How to run?

### Install dependencies
```bash
npm install
```

### Run the DB
> [!IMPORTANT]  
> You need to have docker installed
```bash
npm run db
```
### Import DB
> [!CAUTION]
> Check that you don't actually modify another DB
```bash
npm run import
```

```bash
npm run dev
```

or

```bash
npm run build && npm start
```

## Access the site
Go to **http://localhost:5001** in your browser.