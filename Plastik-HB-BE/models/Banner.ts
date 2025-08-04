import { Table, HasMany } from 'sequelize-typescript';
import { Content } from './Content';
import { Image } from './Image';

@Table({
    tableName: "banners",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Banner extends Content {
    @HasMany(() => Image, {
        foreignKey: 'image_id',
        sourceKey: 'id'
    })
    declare images: Image[];
}