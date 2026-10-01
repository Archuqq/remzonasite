import {
  BadgeCheck,
  CircleDollarSign,
  Cog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type Advantage = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const advantages: Advantage[] = [
  {
    icon: UsersRound,
    title: "Опытные мастера",
    description: "Более 10 лет в сфере автосервиса.",
  },
  {
    icon: Cog,
    title: "Современное оборудование",
    description: "Диагностика и ремонт на профессиональном оборудовании.",
  },
  {
    icon: BadgeCheck,
    title: "Оригинальные запчасти",
    description: "Работаем напрямую с проверенными поставщиками.",
  },
  {
    icon: CircleDollarSign,
    title: "Прозрачные цены",
    description: "Согласовываем стоимость до начала работ.",
  },
];