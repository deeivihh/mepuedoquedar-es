import { DepartmentScore } from "@/lib/scores/calculateScores";
import {
    FaGraduationCap,
    FaBriefcase,
    FaCoins,
    FaStore,
    FaLandmark,
    FaShieldAlt,
    FaLayerGroup,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { MdLocalHospital, MdOutlineSportsMartialArts, MdOutlineTravelExplore, MdPublic } from "react-icons/md";
import { GiBowlingPin } from "react-icons/gi";
import { FaPeopleGroup } from "react-icons/fa6";

const DEPARTMENT_ICONS: Record<string, IconType> = {
    sanidad: MdLocalHospital,
    educacion: FaGraduationCap,
    empleo: FaBriefcase,
    economia: FaCoins,
    comercio: FaStore,
    turismo: MdOutlineTravelExplore,
    cultura: FaLandmark,
    ocio: GiBowlingPin,
    seguridad: FaShieldAlt,
    juventud: FaPeopleGroup,
    deporte: MdOutlineSportsMartialArts,
    deportes: MdOutlineSportsMartialArts,
    sociedad: MdPublic,
};


function generateStars(number: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (number >= i) {
            stars.push(<IoIosStar key={i} className="text-color-2" />);
        } else if (number >= i - 0.5) {
            stars.push(<IoIosStarHalf key={i} className="text-color-2" />);
        } else {
            stars.push(<IoIosStarOutline key={i} className="text-color-2" />);
        }
    }

    return stars;
}

export default function GeneralScore({ number }: { number: number }) {
    const starRating = (number / 100) * 5;

    function labelText() {
        if (starRating >= 4.5) return "¡Es sin duda tu lugar ideal!"
        if (starRating >= 3.5) return "Es un lugar muy recomendable"
        if (starRating >= 2.5) return "Podría ser una buena opción"
        if (starRating >= 1.5) return "Quizás no sea para ti"
        return "No parece tu lugar ideal"
    }

    const stars = generateStars(starRating);

    return (
        <div className="flex flex-col items-start justify-center gap-4 w-full">
            <div className="flex max-[73rem]:flex-col gap-2 w-full justify-between items-center">
                <div className="flex gap-1 text-5xl max-[23rem]:text-5xl">
                    {stars}
                </div>
                <span
                    className="text-4xl max-[51rem]:text-3xl max-md:text-center font-semibold pt-0.5 text-title"
                >
                    {labelText()}
                </span>
            </div>
        </div>
    );
}

export function ScoreItem({ name, number }: { name: string; number: DepartmentScore }) {
    const Icon = DEPARTMENT_ICONS[name] ?? FaLayerGroup;
    const itemRating = number.maxScore > 0 ? (number.score / number.maxScore) * 5 : 0;
    const stars = generateStars(itemRating);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex gap-2 items-center justify-center">
                <Icon className="text-title text-2xl" />
                <span className="text-title text-2xl font-medium capitalize">{name}</span>
            </div>
            <div className="flex gap-1 text-2xl">
                {stars}
            </div>
        </div>
    );
}
