import { PlusCircle } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";

const DashboardWrapper: FC = () => {
    return (
       <div className="min-h-[100vh] flex flex-col items-center justify-center space-y-4">
      <h2 className="text-lg font-medium">
        Welcom to Lexicon
      </h2>
      <Button>
        <PlusCircle className="w-4 h-4 mr-2" />
        Create a Note
      </Button>
    </div>
    )
}

export default DashboardWrapper