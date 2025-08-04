import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Content } from './Content';

@Table({
    tableName: "images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Image extends Content {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare filePath: string;

    @Column({
        type: DataType.NUMBER,
        allowNull: false
    })
    declare imageOrder: number;

    @ForeignKey(() => Content)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: "content_id"
    })
    declare contentId: string;

    @BelongsTo(() => Content)
    content?: Content;
}