import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Content } from './Content';

@Table({
    tableName: "paragraphs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Paragraph extends Content {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare text: string;

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