import React, { useEffect, useState } from "react";

type Tag = {
  name: string;
  value: number;
  type: string;
};

type TagInputProps = {
  initialTags: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
};

export const TagInput: React.FC<TagInputProps> = ({ initialTags, onTagsChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // Gọi callback mỗi khi tags thay đổi
  useEffect(() => {
    onTagsChange?.(tags);
  }, [tags]);

  const addTag = () => {
    if (!input.trim()) return;
    const foundTag = initialTags.find(tag => tag.name === input);
    
    if(foundTag && tags.find(tag => tag.name === foundTag.name)){
      setError("Mã đã được sử dụng!")
      return
    }
    if(foundTag){
      setTags([...tags, { ...foundTag}]);
      setError("")
    }
    if(!foundTag){
      setError("Mã không tồn tại!")
    }
    // const [name] = input.split(":");
    // if (name) {
      // setTags([...tags, { name: input}]);
      setInput("");
    // }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2 mt-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center px-2 py-1 bg-orange-400 text-white rounded-full text-sm"
          >
            {tag.name}
            <button
              onClick={() => removeTag(index)}
              className="ml-2 text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập voucher"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={tags.length > 0 ? true : false }
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:text-gray-400"
        />
        <button
          onClick={addTag}
          className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <div className="mt-2 text-red-500">
        {error}
      </div>
    </div>
  );
};
