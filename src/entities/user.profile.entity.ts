import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'json' })
  contactDetails: Record<string, string>;

  @Column({ type: 'json' })
  socialLinks: Record<string, string>;
}
