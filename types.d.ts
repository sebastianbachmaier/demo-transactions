
interface IPerson {
    id: number;
    name: string;
}

interface IOrder {
    id: number;
    OrderNumber: number;
    PersonId?: number;
    Person?: IPerson;
}