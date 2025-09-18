import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  mediaUrl: string;

  // 🔹 Maintain counts for performance
  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  // 🔹 Proper relations (instead of arrays)
  @OneToMany(() => Like, (like: Like) => like.post, { cascade: true })
  likes: Like[];

  @OneToMany(() => Comment, (comment: Comment) => comment.post, { cascade: true })
  comments: Comment[];

  @Column({ default: 'public' })
  visibility: string; // later can be enum: public, school, private

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
