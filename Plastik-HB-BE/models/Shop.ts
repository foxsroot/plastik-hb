import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
    tableName: "shops",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export class Shop extends Model {
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
        validate: {
            isEmail: true
        }
    })
    declare contactEmail: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            is: /^[0-9]+$/
        }
    })
    declare phoneNumber: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare address: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare mapsUrl: string;
}