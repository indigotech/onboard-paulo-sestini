import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  birthDate: string;

  create({ name, email, password, birthDate }) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.birthDate = birthDate;
  }
}
