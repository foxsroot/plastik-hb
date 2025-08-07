import { Table, Model, Column, DataType, BelongsTo } from 'sequelize-typescript';
import { Page } from './Page';
import { Product } from './Product';

@Table({
    tableName: "analytics",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Analytic extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id"
    })
    declare id: string;

    @Column({
        type: DataType.ENUM('PAGE', 'PRODUCT', 'BUTTON'),
        allowNull: false
    })
    declare type: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: "target_id"
    })
    declare targetId: string;

    @BelongsTo(() => Page, {
        foreignKey: 'target_id',
        constraints: false
    })
    page?: Page;

    @BelongsTo(() => Product, {
        foreignKey: 'target_id',
        constraints: false
    })
    product?: Product;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare url: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "ip_address"
    })
    declare ipAddress: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare location: string;
}