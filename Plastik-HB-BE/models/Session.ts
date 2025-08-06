import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
    tableName: "sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Session extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id"
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare token: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 7)
    })
    declare expires_at: Date;
}