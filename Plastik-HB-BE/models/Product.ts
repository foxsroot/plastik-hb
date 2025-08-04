import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { ProductImage } from './ProductImage';
import { Analytic } from './Analytic';

@Table({
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Product extends Model {
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
    declare name: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false
    })
    declare price: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false
    })
    declare specification: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false
    })
    declare description: string;

    @HasMany(() => ProductImage, {
        foreignKey: 'product_id',
        sourceKey: 'id'
    })
    declare productImages: ProductImage[];

    @HasMany(() => Analytic, {
        foreignKey: 'analytic_id',
        sourceKey: 'id'
    })
    declare analytics: Analytic[];
}