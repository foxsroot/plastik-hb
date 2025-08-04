import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
    tableName: "contents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Content extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id"
    })
    declare id: string;

    @Column({
        type: DataType.NUMBER,
        allowNull: false
    })
    declare order: number;
}