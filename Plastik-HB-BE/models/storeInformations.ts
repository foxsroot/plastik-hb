import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
    tableName: "store_informations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class StoreInformations extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "information_id"
    })
    declare informationId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "information_key"
    })
    declare informationKey: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare value: string;
}