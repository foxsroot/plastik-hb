import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Page } from './Page';

@Table({
    tableName: "sections",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Section extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id"
    })
    declare id: string;

    @ForeignKey(() => Page)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: "page_id",
    })
    declare pageId: string;

    @BelongsTo(() => Page, {
        foreignKey: 'page_id',
        constraints: false
    })
    page?: Page;

    @Column({
        type: DataType.ENUM('HERO', 'ACHIEVEMENTS', 'PRODUCTS', 'TESTIMONIALS', 'ADDRESS'),
        allowNull: false,
    })
    declare type: 'HERO' | 'ACHIEVEMENTS' | 'PRODUCTS' | 'TESTIMONIALS' | 'ADDRESS';

    @Column({
        type: DataType.NUMBER,
        allowNull: false,
    })
    declare order: number;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    declare data: object;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    declare visible: boolean;
}