import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Content } from './Content';

@Table({
    tableName: "buttons",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Button extends Content {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare text: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare url: string;

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