import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Asset } from './Asset';

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