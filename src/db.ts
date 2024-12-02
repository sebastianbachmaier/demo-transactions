import { DataTypes, Model, Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "mysql://root:UtqexzCcEDkw5Kuj2hf74r@localhost:3407/mydb"
);

export class Persons extends Model {
  declare id: number;
  declare name: string;
}

Persons.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, timestamps: false }
);

export class Orders extends Model {
  declare id: number;
  declare OrderNumber: number;
  declare PersonId: number;
  declare Person: Persons;
}

Orders.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    OrderNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, timestamps: false }
);

Persons.hasMany(Orders);

sequelize.authenticate().then(async () => {
  /* only wait 1 second for lock timeout */
  await sequelize.query("SET GLOBAL innodb_lock_wait_timeout = 1;");
  await sequelize.query("SET SESSION innodb_lock_wait_timeout = 1;");
});
