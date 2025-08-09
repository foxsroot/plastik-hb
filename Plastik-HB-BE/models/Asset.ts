import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './Product';

@Table({
    tableName: "assets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Asset extends Model {
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
    declare url: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare alt: string;

    @Column({
        type: DataType.ENUM('IMAGE', 'VIDEO'),
        allowNull: false,
    })
    declare type: 'IMAGE' | 'VIDEO';

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare order: number;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare product_id: string;

    @BelongsTo(() => Product)
    product?: Product;
}