import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { User } from './user';

@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cep: string;

  @Column()
  street: string;

  @Column()
  streetNumber: number;

  @Column({ nullable: true })
  complement: string;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;
}
