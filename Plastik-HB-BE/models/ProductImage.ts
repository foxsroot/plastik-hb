import { Table, Model, Column, DataType, BelongsTo } from 'sequelize-typescript';
import { Product } from './Product';

@Table({
    tableName: "product_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class ProductImage extends Model {
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
    declare filePath: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare order: number;

    @BelongsTo(() => Product, {
        foreignKey: 'product_id',
        targetKey: 'id'
    })
    declare product: Product;
}