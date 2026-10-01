export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Запись",
    description: "Вы звоните нам и договариваетесь об удобном времени визита.",
  },
  {
    number: "02",
    title: "Диагностика",
    description: "Определяем причину неисправности и состояние автомобиля.",
  },
  {
    number: "03",
    title: "Смета",
    description: "Согласовываем стоимость работ до начала ремонта.",
  },
  {
    number: "04",
    title: "Ремонт",
    description: "Выполняем работы и при необходимости присылаем фотоотчёт.",
  },
  {
    number: "05",
    title: "Выдача",
    description: "Возвращаем автомобиль владельцу с гарантией на работы.",
  },
];