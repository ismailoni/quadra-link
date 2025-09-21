import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../../common/enums/user-role.enum';
import { OneToMany } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../posts/entities/comment.entity';
import { Like } from '../../posts/entities/like.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;
  
  @Column({ nullable: false })
  school: string;

  @Exclude() // exclude from responses by default
  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  level: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
