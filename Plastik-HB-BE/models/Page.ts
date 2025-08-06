import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Section } from './Section';

@Table({
    tableName: "pages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Page extends Model {
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
    declare title: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare slug: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    declare published: boolean;

    @HasMany(() => Section, {
        foreignKey: 'page_id',
        sourceKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    sections?: Section[];
}