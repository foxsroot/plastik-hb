import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Content } from './Content';

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

    @HasMany(() => Content, {
        foreignKey: 'content_id',
        sourceKey: 'id'
    })
    declare contents: Content[];
}