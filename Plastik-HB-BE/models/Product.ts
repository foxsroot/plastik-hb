import { Table, Model, Column, DataType, HasMany, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import { Asset } from './Asset';
import { Category } from './Category';

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
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare price: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare specification: string;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare category_id: string;

    @BelongsTo(() => Category)
    category?: Category;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    declare discount: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    declare featured: boolean;

    @HasMany(() => Asset, {
        foreignKey: 'product_id',
        sourceKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    assets?: Asset[];
}