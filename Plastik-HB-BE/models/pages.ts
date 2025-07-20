import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
    tableName: "pages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Pages extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "page_id"
    })
    declare pageId: string;

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