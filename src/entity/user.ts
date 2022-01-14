import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Address } from './address';

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

  @OneToMany(() => Address, (address) => address.user, { cascade: true, eager: true })
  addresses: Address[];

  create({ name, email, password, birthDate }) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.birthDate = birthDate;
  }
}
