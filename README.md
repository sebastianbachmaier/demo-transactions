
# Sequelize Transaction Sandbox 
Try out how sequelize transaction parameters influence when transactions lock and when they modify what.

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

### Run the DB
```bash
npm run db
```
### Import DB
!!! Check that you don't actually modify another DB
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